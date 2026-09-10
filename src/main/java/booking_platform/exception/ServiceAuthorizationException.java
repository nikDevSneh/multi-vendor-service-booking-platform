package booking_platform.exception;

public class ServiceAuthorizationException extends RuntimeException {

    public ServiceAuthorizationException(String message) {
        super(message);
    }
}