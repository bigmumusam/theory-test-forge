package com.medical.exam.service;

import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.medical.exam.common.exception.CustomException;
import com.medical.exam.dto.*;
import com.medical.exam.entity.SysLog;
import com.medical.exam.entity.SysUser;
import com.medical.exam.entity.SysRole;
import com.medical.exam.mapper.SysLogMapper;
import com.medical.exam.mapper.SysUserMapper;
import com.medical.exam.mapper.SysRoleMapper;
import com.medical.exam.security.JwtAccessContext;
import com.medical.exam.security.JwtUtil;
import com.medical.exam.vo.CustomToken;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Pattern;

import static com.medical.exam.entity.table.SysUserTableDef.SYS_USER;
import static com.medical.exam.entity.table.SysRoleTableDef.SYS_ROLE;

@Service
@Slf4j
public class AuthService {

    @Resource
    private SysUserMapper userMapper;

    @Resource
    private SysRoleMapper roleMapper;

    @Resource
    private SysLogMapper sysLogMapper;

    @Resource
    private JwtUtil jwtUtil;

    // 身份证号格式验证：18位，前17位数字，最后一位数字或X
    private static final Pattern ID_PATTERN = Pattern.compile(
        "^\\d{17}[\\dXx]$"
    );

    public LoginResponse login(LoginRequest request) {
        // 验证身份证号格式
        if (!ID_PATTERN.matcher(request.getIdNumber()).matches()) {
            throw new CustomException("身份证号格式错误");
        }

        // 查找用户
//        SysUser user = userMapper.findByIdNumberAndName(request.getIdNumber(), request.getName());
        SysUser user = userMapper.selectOneByQuery(QueryWrapper.create()
                .where(SYS_USER.ID_NUMBER.eq(request.getIdNumber().trim()))
                .and(SYS_USER.USER_NAME.eq(request.getName().trim()))
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
                .userCategory(request.getUserCategory())
                .createBy(customToken.getUserName())
                .build());
    }

    public void updateUser(UserUpdateRequestDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        userMapper.update(SysUser.builder()
                  .userId(request.getUserId())
//                .idNumber(request.getIdNumber())
                .userName(request.getUserName())
                .role(request.getRole())
                .status(request.getStatus())
                .department(request.getDepartment())
                .userCategory(request.getUserCategory())
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

        return  userMapper.paginate(userQueryDTO.getPageNumber(), userQueryDTO.getPageSize(), queryWrapper);
    }





    public void deleteUser(String id) {
        userMapper.deleteById(id);
    }

    public String importUsers(MultipartFile file) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<SysUser> sysUsers = new ArrayList<>();
        try{
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            List<Map<String, Object>> readAll = reader.readAll();
            readAll.forEach(System.out::println);


            // 处理读取到的数据
            for (Map<String, Object> row : readAll) {
                // 处理每一行数据
                Object nameObj = row.get("姓名");
                Object idNumberObj = row.get("身份证号");
                Object departmentObj = row.get("所属部门");
                Object roleObj = row.get("所属角色");
                Object userCategoryObj = row.get("人员类别");

                // 检查五个字段是否有一个为空
                if (nameObj == null || idNumberObj == null || departmentObj == null || roleObj == null || userCategoryObj == null) {

                    continue; // 忽略该条数据
                }

                String name = nameObj.toString().trim();
                String idNumber = idNumberObj.toString().trim();
                String department = departmentObj.toString().trim();
                String role = roleObj.toString().trim();
                String userCategory = userCategoryObj.toString().trim();

                // 进一步检查字符串是否为空
                if (name.isEmpty() || idNumber.isEmpty() || department.isEmpty() || role.isEmpty() || userCategory.isEmpty()) {
                    log.error("存在空值 name:{}，idNumber:{}，department:{}，role:{}，userCategory:{}",name,idNumber,department,role,userCategory);
                    continue;
                }
                log.info("导入用户 name:{}，idNumber:{}，department:{}，role:{}，userCategory:{}",name,idNumber,department,role,userCategory);
                //判断idNumber 是否已经存在
                long count = userMapper.selectCountByQuery(QueryWrapper.create().where(SYS_USER.ID_NUMBER.eq(idNumber)));
                if(count>0){
                    log.info("idNumber:{}已存在",idNumber);
                    continue;
                }
                sysUsers.add(SysUser.builder()
                        .userName(row.get("姓名").toString())
                        .idNumber(row.get("身份证号").toString())
                        .department(row.get("所属部门").toString())
                        .role(getRoleCodeByName(row.get("所属角色").toString()))
                        .userCategory(row.get("人员类别").toString())
                                .status("1")
                                .createBy(customToken.getUserName())
                        .build());
            }
            userMapper.insertBatch(sysUsers);
        }catch (Exception e){
            log.error("导入用户错误:{}",e);
            throw new CustomException("导入用户错误:"+e.getMessage());
        }
        String message =  "成功导入用户"+sysUsers.size()+"条";
        sysLogMapper.insert(SysLog.builder()
                        .userId(customToken.getUserId())
                        .userName(customToken.getUserName())
                        .content(message)
                .build());
        return message;
    }


    public void batchDeleteUsers(Map<String, Object> request) {
        List<String> userIds = (List<String>) request.get("userIds");
        System.out.println("批量删除用户，数量: " + userIds.size());
    }

    // 角色管理
    public Page<SysRole> getRoles(RoleQueryDTO queryDTO) {
        QueryWrapper queryWrapper = QueryWrapper.create()
            .where(SYS_ROLE.ROLE_NAME.like(queryDTO.getKeyword()).or(SYS_ROLE.ROLE_KEY.like(queryDTO.getKeyword())))
            .and(SYS_ROLE.STATUS.eq(queryDTO.getStatus())).orderBy(SYS_ROLE.ROLE_SORT.asc());
        return roleMapper.paginate(queryDTO.getPageNumber(), queryDTO.getPageSize(), queryWrapper);
    }

    public void addRole(RoleRequestDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        roleMapper.insert(SysRole.builder()
            .roleName(request.getRoleName())
            .roleKey(request.getRoleKey())
            .roleSort(request.getRoleSort())
            .status(request.getStatus())
            .remark(request.getRemark())
            .createBy(customToken.getUserName())
            .build());
    }

    public void updateRole(RoleUpdateRequestDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        roleMapper.update(SysRole.builder()
            .roleId(request.getRoleId())
            .roleName(request.getRoleName())
            .roleKey(request.getRoleKey())
            .roleSort(request.getRoleSort())
            .status(request.getStatus())
            .remark(request.getRemark())
            .updateBy(customToken.getUserName())
            .build());
    }

    public void deleteRole(String id) {
        roleMapper.deleteById(id);
    }

    private String getRoleCodeByName(String roleName){
        if(roleName.equals("普通考生")){
            return "student";
        }
        if(roleName.equals("考试管理员")){
            return "exam_admin";
        }
        if(roleName.equals("系统管理员")){
            return "admin";
        }
        return "student";
    }

}
