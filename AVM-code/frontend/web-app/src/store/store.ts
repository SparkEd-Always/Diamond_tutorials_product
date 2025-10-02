import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import attendanceReducer from './slices/attendanceSlice';
import communicationsReducer from './slices/communicationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentsReducer,
    teachers: teachersReducer,
    attendance: attendanceReducer,
    communications: communicationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;