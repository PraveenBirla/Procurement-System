package com.eps.enterprise_procurement_system.advices;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentials(BadCredentialsException ex) {


        ApiError apiError = ApiError.builder()
                .status(HttpStatus.UNAUTHORIZED)
                .message(ex.getMessage())
                .build();

        return buildErrorResponseEntity(apiError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationError(MethodArgumentNotValidException ex){

                String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        ApiError apiError = ApiError.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST)
                .build();

        return buildErrorResponseEntity(apiError);

    }


    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<?>> handleResponseStatusException(
            ResponseStatusException ex) {


        String message = ex.getReason();

        ApiError apiError = ApiError.builder()
                .message(message)
                .status((HttpStatus) ex.getStatusCode())
                .build();

        return buildErrorResponseEntity(apiError);

    }

    private ResponseEntity<ApiResponse<?>> buildErrorResponseEntity(ApiError apiError) {
        return new ResponseEntity<>(new ApiResponse<>(apiError), apiError.getStatus());
    }



}
