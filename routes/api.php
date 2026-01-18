<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FollowController;
use Illuminate\Support\Facades\Broadcast;

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Broadcast::routes([
    'middleware' => ['auth:sanctum'],
]);

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);

// Social Auth
Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
Route::post('/guest-login', [AuthController::class, 'guestLogin']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::middleware('auth:sanctum')->delete('/delete-account', [AuthController::class, 'deleteAccount']);
Route::delete('/guest/delete-account', [AuthController::class, 'deleteGuestAccount']);
Route::post('/save-preferences', [AuthController::class, 'savePreferences']);
Route::get('/me', [AuthController::class, 'me']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/save-preferences', [AuthController::class, 'savePreferences']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    
    // Chat routes
    Route::prefix('chat')->group(function () {
        Route::post('/start', [ChatController::class, 'startLooking']);
        Route::post('/stop', [ChatController::class, 'stopLooking']);
        Route::post('/send', [ChatController::class, 'sendMessage']);
        Route::post('/send-media', [ChatController::class, 'sendMessage']);
        Route::post('/end', [ChatController::class, 'endChat']);
        Route::post('/skip', [ChatController::class, 'skipPartner']);
        Route::get('/status', [ChatController::class, 'checkStatus']);
        Route::get('/messages/{session_id}', [ChatController::class, 'getMessages']);
        Route::get('/history', [ChatController::class, 'history']);
        Route::post('/dm/start', [ChatController::class, 'startDirectChat']);
        Route::delete('/delete/{session_id}', [ChatController::class, 'deleteSession']);
        Route::delete('/delete-by-friend/{friend_id}', [ChatController::class, 'deleteByFriend']);
        Route::post('/read/{session_id}', [ChatController::class, 'markAsRead']);
        Route::post('/call/initiate', [ChatController::class, 'initiateCall']);
        Route::post('/call/respond', [ChatController::class, 'respondToCall']);
        Route::post('/call/signal', [ChatController::class, 'signalWebRTC']);
    });

    // Follow routes
    Route::prefix('follow')->group(function () {
        Route::post('/request', [FollowController::class, 'store']);
        Route::post('/respond', [FollowController::class, 'update']);
        Route::get('/followers', [FollowController::class, 'followers']);
        Route::get('/following', [FollowController::class, 'following']);
        Route::get('/friends', [FollowController::class, 'friends']);
        Route::get('/history', [FollowController::class, 'history']);
        Route::get('/requests', [FollowController::class, 'pendingRequests']);
        Route::post('/remove', [FollowController::class, 'removeFriend']);
        Route::post('/block', [FollowController::class, 'blockUser']);
        Route::post('/unblock', [FollowController::class, 'unblockUser']);
    });
});

//click start text then redirect to another page like start/new route and open popup like below 
//Before you start...
//Select your gender so we can match you with the right people.
//I am:
//select male or female radio button with icons
//
//*You cannot change your gender after you register.
//
//I'm at least 18 years old and have read and agree to the Terms of Service and Privacy Policy
//
//below is the button I Aggre, Let's go 
//
//
//already have account? login
//
//
//    after click agreen button show i am human captcha
//
//
//
//after refirect to chat/new route 
//there is another model open 
//
//Video Chat is now live! 🎉
//We now have a video chat section! You can now chat with your matches face-to-face. Give it a try! 🚀
//below is 2 button 
//Try out!
//Not now 
