const apiPort = process.env.PORT || '8000';
export const apiUri = `http://localhost:${apiPort}`;

export const quizPath = `${apiUri}/quiz`;
export const quizTopicPath = `${quizPath}/topic`
export const quizTopicLevels = (topicName: string): string =>`${quizPath}/${topicName}/level`
export const quizIdPath = (topicName: string, level: string): string =>`${quizPath}/${topicName}/${level}`
export const singleQuizIdPath = (id: string): string => `${quizPath}/${id}`

export const singleQuestionIdPath = (quizId: string, questionId: string, ) => `${quizPath}/${quizId}/${questionId}`;

export const scorePath = (username: string): string => `${apiUri}/user/${username}/score`;

export const userPath = `${apiUri}/user`;

export const loginPath = `${apiUri}/login`;
export const registerPath = `${apiUri}/register`;

export const securityPath = `${apiUri}/access`;
