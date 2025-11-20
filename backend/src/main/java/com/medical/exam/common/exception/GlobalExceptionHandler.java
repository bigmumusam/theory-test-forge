package com.medical.exam.common.exception;

import com.medical.exam.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataAccessException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.OK)
    public Result<?> handleCustomException(CustomException customException) {
        return Result.error(customException);
    }

    @ExceptionHandler({NullPointerException.class})
    @ResponseBody
    @ResponseStatus(HttpStatus.OK)
    public Result<?> handleRuntimeException(NullPointerException nullPointerException) {
        log.error("NullPoint Error: ",nullPointerException);
        return Result.error(nullPointerException.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldError() != null ? ex.getBindingResult().getFieldError().getDefaultMessage() : "参数校验失败";
        return Result.error(msg);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Result<?> handleMissingParam(MissingServletRequestParameterException ex) {
        return Result.error("缺少请求参数: " + ex.getParameterName());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<?> handleNotReadable(HttpMessageNotReadableException ex) {
        log.error("请求体格式错误: ", ex);
        String message = ex.getMessage();
        if (message != null && message.contains("JSON parse error")) {
            return Result.error("JSON格式错误: " + (ex.getCause() != null ? ex.getCause().getMessage() : message));
        }
        return Result.error("请求体格式错误: " + (ex.getCause() != null ? ex.getCause().getMessage() : message));
    }

    @ExceptionHandler(DataAccessException.class)
    public Result<?> handleDataAccess(DataAccessException ex) {

        log.error("数据库操作异常",ex);
        return Result.error("数据库操作异常");
    }

    @ExceptionHandler(Exception.class)
    public Result<?> handleOther(Exception ex) {
        log.error("服务器内部错误",ex);
        return Result.error("服务器内部错误: " + ex.getMessage());
    }
} 