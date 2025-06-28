import jwt from "jsonwebtoken"; // Import the entire module
const { sign, verify } = jwt;   // Extract required functions

const secret = process.env.AUTH_SECRET;

export function setUser(user) {
    return sign({
        _id: user._id,
        email: user.email,
    }, secret, { expiresIn: '1d' });
}

export function getUser(token) {
    if (!token) return null;
    try {
        return verify(token, secret);
    } catch (error) {
        return null;
    }
}
