package com.teammatching.backend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "Invalid Input Value"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C002", "Method Not Allowed"),
    ENTITY_NOT_FOUND(HttpStatus.BAD_REQUEST, "C003", "Entity Not Found"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C004", "Server Error"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "C005", "Invalid Type Value"),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C006", "Access is Denied"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "User not found"),
    EMAIL_DUPLICATION(HttpStatus.BAD_REQUEST, "U002", "Email is Duplication"),
    LOGIN_INPUT_INVALID(HttpStatus.BAD_REQUEST, "U003", "Login input is invalid"),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "A001", "Invalid email or password"),

    //project
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "Project not found"),
    FORBIDDEN_PROJECT_ACCESS(HttpStatus.FORBIDDEN, "P002", "You do not have permission to access this project"),

    // application
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "AP001", "Application not found"),
    DUPLICATE_APPLICATION(HttpStatus.BAD_REQUEST, "AP002", "Already applied to this project"),
    FORBIDDEN_APPLICATION_ACCESS(HttpStatus.FORBIDDEN, "AP003", "You do not have permission to access this application"),
    PROJECT_CLOSED(HttpStatus.BAD_REQUEST, "AP004", "This project is no longer recruiting");
    
    private final HttpStatus status;
    private final String code;
    private final String message;

}
