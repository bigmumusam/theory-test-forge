package com.medical.exam.common.result;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medical.exam.common.exception.CustomException;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 统一返回结果
 */
@Data
public class Result<T> {
    
    private Integer code;
    private String message;
    private T data;
    
//    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
//    private LocalDateTime timestamp;

    public Result() {

    }

    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }

    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }

    public static <T> Result<T> error() {
        return new Result<>(500, "操作失败", null);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }

    public static<T> Result<T> error(CustomException customException){
        Result<T> httpResult = new Result<T>();
        httpResult.setCode(customException.getCode());
        httpResult.setMessage(customException.getMessage());
        return  httpResult;

    }

    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}
