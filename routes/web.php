<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::view('/chat/{any?}', 'app')->where('any', '.*');
Route::view('/{any}', 'app')->where('any', '.*');
