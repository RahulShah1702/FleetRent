export const saveAuth = (token, user, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
    localStorage.setItem("role", role);
};


export const getToken = () => {
    return localStorage.getItem("token");
};


export const getUser = () => {
    const user =
        localStorage.getItem("user");

    return user
        ? JSON.parse(user)
        : null;
};


export const getRole = () => {
    return localStorage.getItem("role");
};


export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
};