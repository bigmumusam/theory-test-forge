package com.medical.exam.common.exception;


import com.medical.exam.common.enums.CustomExceptionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Dongyao
 * @date 2024/8/8 13:46
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CustomException extends RuntimeException{
    //异常错误编码
    private Integer code ;
    //异常信息
    private String message;

    public CustomException(CustomExceptionEnum exceptionTypeEnum) {
        this.code = exceptionTypeEnum.getCode();
        this.message = exceptionTypeEnum.getDesc();
    }

    public CustomException(CustomExceptionEnum exceptionTypeEnum,
                           String message) {
        this.code = exceptionTypeEnum.getCode();
        this.message = message;
    }

    public CustomException(String message) {
        this.code = 500;
        this.message = message;
    }

}
