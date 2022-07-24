package WEB3D.exception;

public class BadAuthRequestException extends RuntimeException {
    public BadAuthRequestException() {
        super("Bad auth type requested or bad location selected");
    }
}
