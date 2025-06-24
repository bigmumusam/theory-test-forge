
package com.medical.exam.service;

import com.medical.exam.common.exception.CustomException;
import com.medical.exam.dto.*;
import com.medical.exam.entity.SysUser;
import com.medical.exam.mapper.SysUserMapper;
import com.medical.exam.security.JwtAccessContext;
import com.medical.exam.security.JwtUtil;
import com.medical.exam.vo.CustomToken;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Pattern;

import static com.medical.exam.entity.table.SysUserTableDef.SYS_USER;

@Service
public class AuthService {

    @Resource
    private SysUserMapper userMapper;

    @Resource
    private JwtUtil jwtUtil;

    private static final Pattern ID_PATTERN = Pattern.compile(
        "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"
    );

    public LoginResponse login(LoginRequest request) {
        // 验证身份证号格式
        if (!ID_PATTERN.matcher(request.getIdNumber()).matches()) {
            throw new CustomException("身份证号格式错误");
        }

        // 查找用户
//        SysUser user = userMapper.findByIdNumberAndName(request.getIdNumber(), request.getName());
        SysUser user = userMapper.selectOneByQuery(QueryWrapper.create()
                .where(SYS_USER.ID_NUMBER.eq(request.getIdNumber()))
                .and(SYS_USER.USER_NAME.eq(request.getName()))
                .and(SYS_USER.STATUS.eq("1")));
        if (user == null) {
            throw new CustomException("用户信息不存在");
        }

        if (!"1".equals(user.getStatus())) {
            throw new CustomException("用户账号已被停用");
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


    public void addUser(UserRequestDTO request) {
        long count = userMapper.selectCountByQuery(QueryWrapper.create().where(SYS_USER.ID_NUMBER.eq(request.getIdNumber())));
        if(count>0){
            throw new CustomException("该用户已存在,请勿重复添加");
        }

        CustomToken customToken = JwtAccessContext.getLoginInfo();
        userMapper.insert(SysUser.builder()
                .idNumber(request.getIdNumber())
                .userName(request.getUserName())
                .role(request.getRole())
                .status("1")
                .department(request.getDepartment())
                .createBy(customToken.getUserName())
                .build());
    }

    public void updateUser(UserUpdateRequestDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        userMapper.update(SysUser.builder()
                  .userId(request.getId())
//                .idNumber(request.getIdNumber())
                .userName(request.getUserName())
                .role(request.getRole())
                .status(request.getStatus())
                .department(request.getDepartment())
                .updateBy(customToken.getUserName())
                .build());
    }

    // 用户管理
    public Page<SysUser> getUsers(UserQueryDTO userQueryDTO) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .where(SYS_USER.USER_NAME.like(userQueryDTO.getKeyword()).or(SYS_USER.ID_NUMBER.like(userQueryDTO.getKeyword())))
                .and(SYS_USER.ROLE.eq(userQueryDTO.getRole()))
                .and(SYS_USER.STATUS.eq(userQueryDTO.getStatus()))
                .and(SYS_USER.DEPARTMENT.eq(userQueryDTO.getDepartment()));

        return  userMapper.paginate(userQueryDTO.getPageNum(), userQueryDTO.getPageSize(), queryWrapper);
    }





    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }

    public Map<String, Object> importUsers(MultipartFile file, Long userId) {
        System.out.println("导入用户文件: " + file.getOriginalFilename() + ", 操作用户: " + userId);

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", 5);
        result.put("failCount", 0);
        result.put("total", 5);

        return result;
    }


    public void batchDeleteUsers(Map<String, Object> request) {
        List<String> userIds = (List<String>) request.get("userIds");
        System.out.println("批量删除用户，数量: " + userIds.size());
    }

    // 角色管理
    public Map<String, Object> getRoles(String status, String keyword, Integer page, Integer size) {
        List<Map<String, Object>> roles = new ArrayList<>();

        Map<String, Object> role1 = new HashMap<>();
        role1.put("id", "1");
        role1.put("roleName", "系统管理员");
        role1.put("roleKey", "admin");
        role1.put("roleSort", 1);
        role1.put("status", "1");
        role1.put("remark", "超级管理员，拥有所有权限");
        role1.put("createTime", "2024-01-15 10:00:00");
        roles.add(role1);

        Map<String, Object> role2 = new HashMap<>();
        role2.put("id", "2");
        role2.put("roleName", "普通考生");
        role2.put("roleKey", "student");
        role2.put("roleSort", 2);
        role2.put("status", "1");
        role2.put("remark", "普通考生，只能参加考试");
        role2.put("createTime", "2024-01-15 10:30:00");
        roles.add(role2);

        Map<String, Object> response = new HashMap<>();
        response.put("data", roles);
        response.put("total", roles.size());
        response.put("page", page);
        response.put("size", size);

        return response;
    }

    public void addRole(Map<String, Object> request, Long userId) {
        System.out.println("添加角色: " + request + ", 操作用户: " + userId);
    }

    public void updateRole(String id, Map<String, Object> request, Long userId) {
        System.out.println("更新角色ID: " + id + ", 数据: " + request + ", 操作用户: " + userId);
    }

    public void deleteRole(String id) {
        System.out.println("删除角色ID: " + id);
    }
}
