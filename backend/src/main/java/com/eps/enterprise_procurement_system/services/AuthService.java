package com.eps.enterprise_procurement_system.services;


import com.eps.enterprise_procurement_system.dto.LoginRequestDTO;
import com.eps.enterprise_procurement_system.dto.RegisterDTO;
import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.DepartmentRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final DepartmentRepo departmentRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(ModelMapper modelMapper, UserRepository userRepository, DepartmentRepo departmentRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.modelMapper = modelMapper;
        this.userRepository = userRepository;
        this.departmentRepo = departmentRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }


    public RegisterDTO register(RegisterDTO dto){

        Department dept = dto.getDepartmentId() != null
                ? departmentRepo.findById(dto.getDepartmentId()).orElse(null) : null;

        User user = User.builder()
            .fullName(dto.getFullName())
            .email(dto.getEmail())
            .password(passwordEncoder.encode(dto.getPassword()))
            .role(dto.getRole())
            .department(dept)
            .isActive(true)
            .build();
        User saved = userRepository.save(user);
        
        return modelMapper.map(saved, RegisterDTO.class);

    }

    public  String login(LoginRequestDTO dto){

        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            User user = (User) authentication.getPrincipal();
        }
        catch (BadCredentialsException e){
              throw  new BadCredentialsException("Invalid Email or password");
        }
       return "login sucessfully";
    }
}
