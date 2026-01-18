import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    followers: [],
    pastMatches: [],
    onlineUsers: [],
    pendingRequests: [],
    preferences: {
        interestsEnabled: true,
        interests: [],
        interestInput: '',
        maxDuration: '∞',
        genderFilter: 'both',
    },
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setFollowers: (state, action) => {
            state.followers = action.payload;
        },
        setPastMatches: (state, action) => {
            state.pastMatches = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        addOnlineUser: (state, action) => {
            const newUser = action.payload;
            if (!state.onlineUsers.some(u => Number(u.id) === Number(newUser.id))) {
                state.onlineUsers.push(newUser);
            }
        },
        removeOnlineUser: (state, action) => {
            const leavingUser = action.payload;
            state.onlineUsers = state.onlineUsers.filter(u => Number(u.id) !== Number(leavingUser.id));
        },
        setPendingRequests: (state, action) => {
            state.pendingRequests = action.payload;
        },
        updatePreferences: (state, action) => {
            state.preferences = { ...state.preferences, ...action.payload };
        },
        incrementUnreadCount: (state, action) => {
            const friendId = action.payload;
            const friendIndex = state.followers.findIndex(f => f.id === friendId);
            if (friendIndex !== -1) {
                // Ensure unread_count is a number before incrementing
                const currentCount = Number(state.followers[friendIndex].unread_count) || 0;
                state.followers[friendIndex].unread_count = currentCount + 1;
            }
        },
        clearUnreadCount: (state, action) => {
            const friendId = action.payload;
            const friendIndex = state.followers.findIndex(f => f.id === friendId);
            if (friendIndex !== -1) {
                state.followers[friendIndex].unread_count = 0;
            }
        },
    },
});

export const { setFollowers, setPastMatches, setOnlineUsers, addOnlineUser, removeOnlineUser, setPendingRequests, updatePreferences, incrementUnreadCount, clearUnreadCount } = chatSlice.actions;
export default chatSlice.reducer;
