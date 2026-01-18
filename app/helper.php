<?php


if (! function_exists('generateRandomString')) {
    function generateRandomString($length = 6)
    {
        $characters = 'abcdefghijklmnopqrstuvwxyz';
        $str = '';

        for ($i = 0; $i < $length; $i++) {
            $str .= $characters[rand(0, strlen($characters) - 1)];
        }

        return ucfirst($str);
    }
}

if (! function_exists('generateRandomName')) {
    function generateRandomName()
    {
        $firstParts = [
            'Fire', 'Ice', 'Storm', 'Shadow', 'Ghost', 'Phantom', 'Spirit',
            'Dream', 'Night', 'Moon', 'Star', 'Sun', 'Sky', 'Ocean',
            'Mountain', 'Forest', 'Desert', 'River', 'Stone', 'Crystal',
            'Metal', 'Gold', 'Silver', 'Iron', 'Steel', 'Dragon', 'Wolf',
            'Raven', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Fox', 'Hawk',
        ];

        $secondParts = [
            'Heart', 'Soul', 'Blade', 'Fang', 'Claw', 'Wing', 'Walker',
            'Rider', 'Hunter', 'Seeker', 'Keeper', 'Guardian', 'Warden',
            'Caller', 'Weaver', 'Breaker', 'Bringer', 'Slayer', 'Born',
            'Child', 'Lord', 'King', 'Queen', 'Master', 'Strider', 'Dancer',
            'Singer', 'Whisper', 'Echo', 'Shadow', 'Flame', 'Ash', 'Wind',
            'Wave', 'Stone',
        ];

        if (rand(1, 100) <= 70) {
            $first = $firstParts[array_rand($firstParts)];
            $second = $secondParts[array_rand($secondParts)];
            return "$first $second";
        } else {
            $epicNames = [
                'Ragnarok', 'Armageddon', 'Odyssey', 'Legacy', 'Legend',
                'Myth', 'Fable', 'Chronicle', 'Saga', 'Epic', 'Destiny',
                'Fate', 'Fortune', 'Doom', 'Gloom', 'Bloom', 'Zenith',
                'Nadir', 'Apex', 'Pinnacle', 'Summit', 'Peak', 'Abyss',
                'Void', 'Chaos', 'Order', 'Balance', 'Harmony',
            ];
            return $epicNames[array_rand($epicNames)];
        }
    }
}