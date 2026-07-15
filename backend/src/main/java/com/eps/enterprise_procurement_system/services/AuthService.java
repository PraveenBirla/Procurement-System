package com.eps.enterprise_procurement_system.services;


import com.eps.enterprise_procurement_system.dto.LoginRequestDTO;
import com.eps.enterprise_procurement_system.dto.RegisterRequestDTO;
import com.eps.enterprise_procurement_system.dto.RegisterResponseDTO;
import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.entities.User;
import com.eps.enterprise_procurement_system.repositories.DepartmentRepo;
import com.eps.enterprise_procurement_system.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final DepartmentRepo departmentRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(ModelMapper modelMapper, UserRepository userRepository, DepartmentRepo departmentRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.modelMapper = modelMapper;
        this.userRepository = userRepository;
        this.departmentRepo = departmentRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }


    public RegisterResponseDTO register(RegisterRequestDTO dto){

        Department dept = dto.getDepartmentId() != null
                ? departmentRepo.findById(dto.getDepartmentId()).orElse(null) : null;

        Optional<User> user1  = userRepository.findByEmail(dto.getEmail());
        if(user1.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with email already present");
        }

        User user = User.builder()
            .fullName(dto.getFullName())
            .email(dto.getEmail())
            .password(passwordEncoder.encode(dto.getPassword()))
            .role(dto.getRole())
            .department(dept)
            .isActive(true)
            .build();
        User saved = userRepository.save(user);
        
         RegisterResponseDTO responseDTO =
                 RegisterResponseDTO.builder()
                         .accesToken(jwtService.generateAceessToken(saved))
                         .message("Register Succesfully")
                         .build();

         return responseDTO;

    }

    public  String login(LoginRequestDTO dto) {

        String token;
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            token = jwtService.generateAceessToken(user);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid Email or password");
        }
        return token;
    }
}
