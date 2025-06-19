
package com.medical.exam.service;

import com.medical.exam.dto.LoginRequest;
import com.medical.exam.dto.LoginResponse;
import com.medical.exam.entity.SysUser;
import com.medical.exam.mapper.SysUserMapper;
import com.medical.exam.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern ID_PATTERN = Pattern.compile(
        "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"
    );

    public LoginResponse login(LoginRequest request) {
        // 验证身份证号格式
        if (!ID_PATTERN.matcher(request.getIdNumber()).matches()) {
            throw new RuntimeException("身份证号格式错误");
        }

        // 查找用户
        SysUser user = userMapper.findByIdNumberAndName(request.getIdNumber(), request.getName());
        if (user == null) {
            throw new RuntimeException("用户信息不存在");
        }

        if (!"1".equals(user.getStatus())) {
            throw new RuntimeException("用户账号已被停用");
        }

        // 生成JWT令牌
        String token = jwtUtil.generateToken(
            user.getUserId().toString(),
            user.getUserName(),
            user.getRole()
        );

        // 构建返回数据
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
            user.getUserId().toString(),
            user.getUserName(),
            user.getIdNumber(),
            user.getRole(),
            user.getDepartment()
        );

        return new LoginResponse(token, userInfo);
    }
}
