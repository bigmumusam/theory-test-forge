package com.medical.exam.common.enums;

import lombok.NoArgsConstructor;

/**
 * @author Dongyao
 * @date 2024/8/8 13:40
 */
@NoArgsConstructor
public enum CustomExceptionEnum {

    /*** 通用部分 100 - 599**
     * 1** 100-199 信息 服务器接收到请求，需要请求者继续执行操作
     * 2** 200-299 成功 请求被成功接收并处理
     * 3** 300-399 重定向 需要进一步的操作以完成请求
     * 4** 400-499 客户端错误 请求包含语法错误或无法完成请求
     * 5** 500-599 服务器错误 服务器在处理的时候发生错误
     *这里可以根据不同模块用不同的区级分开错误码，例如:
     1000～1999 区间表示流程相关错误
     2000～2999 区间表示表单相关错误
     3000～3999 区间表示权限相关错误
     **/
    /**
     * 系统相关
     */
    REQUEST_PARAMS_ERROR(403, "请求参数异常"),
    REQUEST_HEADERS_PARAMS_ERROR(403, "请求头必选参数有空值"),
    OUTER_INTERFACES(5001, "外部接口异常"),
    TOKEN_USER_ERROR(3003,"鉴权失败"),
    NO_TOKEN(3001, "未携带Token"),

    TOKEN_WRONG(3004, "登录失效，请重新登录");

    private Integer code;

    private String desc;

    CustomExceptionEnum(Integer code, String desc){
        this.code=code;
        this.desc=desc;
    }



    public void setCode(Integer code) {
        this.code = code;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return desc;
    }

    public Integer getCode() {
        return code;
    }

}
