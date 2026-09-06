package booking_platform.exception;

public class BookingAuthorizationException extends RuntimeException {

    public BookingAuthorizationException(String message) {
        super(message);
    }
}