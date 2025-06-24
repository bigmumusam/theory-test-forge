package com.medical.exam.security;


import com.alibaba.ttl.TransmittableThreadLocal;
import com.medical.exam.vo.CustomToken;

public class JwtAccessContext {
    /**
     * 使用TransmittableThreadLocal解决线程池中线程之间信息无法共享问题
     * 阿里开源依赖
     */
    private static final ThreadLocal<CustomToken> customTokenInfo = new TransmittableThreadLocal<>();

    public JwtAccessContext() {
    }

    public static CustomToken getLoginInfo() {
        return customTokenInfo.get();
    }

    public static void setLoginInfo(CustomToken customInfo) {
        customTokenInfo.set(customInfo);
    }

    public static void clearLoginInfo() {
        customTokenInfo.remove();
    }
}
