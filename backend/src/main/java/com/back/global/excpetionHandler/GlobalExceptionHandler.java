package com.back.global.excpetionHandler;

import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import java.util.NoSuchElementException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Comparator;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handle(EntityNotFoundException e) {
        return new ResponseEntity<>(
                new ApiResponse<>(
                        "404-1",
                        "존재하지 않는 엔티티에 접근했습니다."
                ),
                NOT_FOUND
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handle(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getAllErrors()
                .stream()
                .filter(error -> error instanceof FieldError)
                .map(error -> (FieldError) error)
                .map(error -> error.getField() + "-" + error.getCode() + "-" + error.getDefaultMessage())
                .sorted(Comparator.comparing(String::toString))
                .collect(Collectors.joining("\n"));

        return new ResponseEntity<>(
                new ApiResponse<>(
                        "400-1",
                        message
                ),
                BAD_REQUEST
        );
    }

    @ExceptionHandler(ServiceException.class)
    public ApiResponse<Void> handle(ServiceException e, HttpServletResponse response) {
        ApiResponse<Void>  apiResponse = e.getApiResponse();

        response.setStatus(apiResponse.statusCode());

        return apiResponse;
    }
}