<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Registered user login (email + password)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (empty($user)) {
            $ip = $request->ip();
            $device = $request->header('User-Agent');
            $country = $this->getCountryFromIP($ip);

            $user = User::create([
                'ip_address'  => $ip,
                'name'        => generateRandomName(),
                'email'       => $request->email,
                'password'    => bcrypt($request->password),
                'device_info' => $device,
                'profile_image' => asset('/assets/profile.jpg'),
                'extra_info'  => [
                    'country' => $country,
                ],
            ]);

            $token = $user->createToken('api')->plainTextToken;
            Auth::login($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'token'   => $token,
                'user'    => $user
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();

        if (empty($user->extra_info['country'])) {
            $country = $this->getCountryFromIP($request->ip());
            $extraInfo = $user->extra_info ?? [];
            $extraInfo['country'] = $country;
            $user->extra_info = $extraInfo;
            $user->save();
        }

        $user->ip_address = $request->ip();
        $user->device_info = $request->header('User-Agent');
        $user->save();

        return response()->json([
            'success' => true,
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user
        ]);
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'profile_image' => 'storage/profile.jpg', // Default
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user
        ]);
    }

    /**
     * Redirect to social provider
     */
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Handle social provider callback
     */
    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Social login failed'], 401);
        }

        $user = User::where($provider . '_id', $socialUser->getId())
            ->orWhere('email', $socialUser->getEmail())
            ->first();

        if ($user) {
            // Update social ID if missing
            if (!$user->{$provider . '_id'}) {
                $user->{$provider . '_id'} = $socialUser->getId();
                $user->save();
            }
        } else {
            // Create new user
            $user = User::create([
                'name'              => $socialUser->getName() ?? $socialUser->getNickname(),
                'email'             => $socialUser->getEmail(),
                'password'          => bcrypt(Str::random(16)),
                $provider . '_id'   => $socialUser->getId(),
                'profile_image'     => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user
        ]);
    }

    /**
     * Guest login — auto create if not exists
     */
    public function guestLogin(Request $request)
    {
        $request->validate([
            'guest_uid' => 'nullable|string',
            'gender'    => 'nullable|string|in:male,female,other',
        ]);

        $guestUid = $request->guest_uid ?? Str::uuid();
        $ip = $request->ip();
        $device = $request->header('User-Agent');
        $gender = $request->gender;

        // Get country from IP
        $country = $this->getCountryFromIP($ip);

        $user = User::where('guest_uid', $guestUid)->first();

        if (!$user) {
            $user = User::where('ip_address', $ip)
                ->where('device_info', $device)
                ->first();
        }

        if (!$user) {
            $user = User::create([
                'guest_uid'   => $guestUid,
                'ip_address'  => $ip,
                'name'  => generateRandomName(),
                'device_info' => $device,
                'profile_image' => 'storage/profile.jpg',
                'extra_info'  => [
                    'gender' => $gender,
                    'country' => $country,
                ],
            ]);
        } else {
            if (!$user->guest_uid) {
                $user->guest_uid = $guestUid;
            }

            $extraInfo = $user->extra_info ?? [];

            if ($gender) {
                $extraInfo['gender'] = $gender;
            }

            if ($country && !isset($extraInfo['country'])) {
                $extraInfo['country'] = $country;
            }

            $user->extra_info = $extraInfo;
            $user->save();
        }

        $response = [
            'success'   => true,
            'guest_uid' => $user->guest_uid,
            'user'      => $user,
        ];

        if (empty($request->isUpdateOnly)) {
            $response['token'] = $user->createToken('guest')->plainTextToken;
        }

        return response()->json($response);
    }

    private function getCountryFromIP($ip)
    {
        if ($ip == '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }

        try {
            // Option 1: Free IP-API (no key required for basic info)
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}");

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['status']) && $data['status'] === 'success') {
                    return $data['country'] ?? null;
                }
            }

            // Option 2: ipinfo.io (free tier available)
            $response = Http::timeout(3)->get("https://ipinfo.io/{$ip}/json");

            if ($response->successful()) {
                $data = $response->json();
                return $data['country'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('IP geolocation failed: ' . $e->getMessage());
        }

        return null;
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found',
            ], 404);
        }

        $newPassword = Str::random(6);
        $user->password = bcrypt($newPassword);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful',
            'new_password' => $newPassword,
        ]);
    }
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    }
    public function deleteGuestAccount(Request $request)
    {
        $request->validate([
            'guest_uid' => 'required|string',
        ]);

        $user = User::where('guest_uid', $request->guest_uid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Guest user not found',
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guest account deleted successfully',
        ]);
    }

    public function savePreferences(Request $request)
    {
        $request->validate([
            'interests'             => 'nullable|array',
            'interests.*'           => 'string',
            'match_with_interests'  => 'nullable|boolean',
            'prefer_gender'         => 'nullable|string|in:male,female,other',
        ]);

        $user = $request->user();

        $extra = $user->extra_info ?? [];

        $extra['interests'] = $request->interests ?? $extra['interests'] ?? [];
        $extra['match_with_interests'] = $request->match_with_interests ?? $extra['match_with_interests'] ?? false;
        $extra['prefer_gender'] = $request->prefer_gender ?? $extra['prefer_gender'] ?? null;

        $user->extra_info = $extra;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Preferences saved successfully',
            'data'    => $user->extra_info,
        ]);
    }

    public function me(Request $request)
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'user'    => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'                  => 'nullable|string|max:255',
            'interests'             => 'nullable|array',
            'interests.*'           => 'string',
            'match_with_interests'  => 'nullable|boolean',
            'profile_image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'badge_visibility'      => 'nullable|string|in:everyone,friends,nobody',
            'interests_visibility'  => 'nullable|string|in:everyone,friends,nobody',
            'allow_friend_requests' => 'nullable|boolean',
            'allow_calls'           => 'nullable|boolean',
            'convert_emoticons'     => 'nullable|boolean',
            'blur_images'           => 'nullable|boolean',
            'notification_sound'    => 'nullable|boolean',
            'push_notifications'    => 'nullable|boolean',
            'dark_mode'             => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Update basic fields
        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('location')) {
            $user->location = $request->location;
        }

        // Update gender only if provided
        $extra = $user->extra_info ?? [];

        if ($request->has('is_interest')) {
            $extra['is_interest'] = $request->is_interest;
        }

        if ($request->has('gender')) {
            $extra['gender'] = $request->gender;
        }

        if ($request->has('interests')) {
            $extra['interests'] = $request->interests;
        }

        if ($request->has('match_with_interests')) {
            $extra['match_with_interests'] = $request->match_with_interests;
        }

        if ($request->has('badge_visibility')) {
            $extra['badge_visibility'] = $request->badge_visibility;
        }

        if ($request->has('interests_visibility')) {
            $extra['interests_visibility'] = $request->interests_visibility;
        }

        if ($request->has('allow_friend_requests')) {
            $extra['allow_friend_requests'] = $request->allow_friend_requests;
        }

        if ($request->has('allow_calls')) {
            $extra['allow_calls'] = $request->allow_calls;
        }

        if ($request->has('convert_emoticons')) {
            $extra['convert_emoticons'] = $request->convert_emoticons;
        }

        if ($request->has('blur_images')) {
            $extra['blur_images'] = $request->blur_images;
        }

        if ($request->has('notification_sound')) {
            $extra['notification_sound'] = $request->notification_sound;
        }

        if ($request->has('push_notifications')) {
            $extra['push_notifications'] = $request->push_notifications;
        }

        if ($request->has('dark_mode')) {
            $extra['dark_mode'] = $request->dark_mode;
        }

        if ($request->has('remove_profile')) {
            if ($user->profile_image && Storage::disk('public')->exists(
                str_replace('storage/', '', $user->profile_image)
            )) {
                Storage::disk('public')->delete(
                    str_replace('storage/', '', $user->profile_image)
                );
            }
            $user->profile_image = null;
        }

        // Save profile image if uploaded
        if ($request->hasFile('profile_image')) {
            // 🔥 Delete old image if exists
            if ($user->profile_image && Storage::disk('public')->exists(
                str_replace('storage/', '', $user->profile_image)
            )) {
                Storage::disk('public')->delete(
                    str_replace('storage/', '', $user->profile_image)
                );
            }

            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->profile_image = 'storage/' . $path;
        }

        // Save merged data
        $user->extra_info = $extra;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data'    => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * @param  Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        // Reset searching status
        $user->update(['is_searching' => false]);

        // Revoke only the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
