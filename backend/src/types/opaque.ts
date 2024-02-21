declare const opaqueProp: unique symbol;
export type Opaque<T, K> = T & {
  [opaqueProp]: K;
};

export type RoomId = Opaque<'roomId', string>;
export type UserId = Opaque<'userId', string>;
export type QuizId = Opaque<'quizId', string>;
