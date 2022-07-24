package WEB3D.exception;

public class PasswordIncorrectException extends RuntimeException {
    public PasswordIncorrectException(String username) {
        super("Username '" + username + "' password incorrect");
    }
}
