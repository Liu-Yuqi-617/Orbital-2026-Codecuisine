export const AUTH_API_DOC = {
  login: {
    method: "POST",
    url: "/login",
    request: {
      username: "string",
      password: "string",
    },
    response: {
      user: {
        username: "string",
        email: "string",
      },
      token: "string",
    },
  },
};