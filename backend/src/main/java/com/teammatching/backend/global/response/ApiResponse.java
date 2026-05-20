package com.teammatching.backend.global.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    private int status;
    private T data;
    private String message;

    private ApiResponse(T data) {
        this.status = 200;
        this.data = data;
        this.message = "success";
    }

    private ApiResponse(T data, String message) {
        this.status = 200;
        this.data = data;
        this.message = message;
    }

    private ApiResponse(int status, T data, String message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message);
    }

    public static <T> ApiResponse<T> success(int status, T data, String message) {
        return new ApiResponse<>(status, data, message);
    }
}
