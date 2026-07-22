package com.eps.enterprise_procurement_system.controllers;

import com.eps.enterprise_procurement_system.advices.ApiResponse;
import com.eps.enterprise_procurement_system.dto.DepartmentRequestDTO;
import com.eps.enterprise_procurement_system.dto.DepartmentResponseDTO;
import com.eps.enterprise_procurement_system.services.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/depts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponseDTO>>> list() {

        List<DepartmentResponseDTO> dtos = departmentService.getDepartments();

        return ResponseEntity.ok(new ApiResponse<>(dtos));

    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> get(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(departmentService.getDepartment(id))
    );
}

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public  ResponseEntity<ApiResponse<Map<String,String>>> create( @Valid  @RequestBody DepartmentRequestDTO dto) {
         String message = departmentService.createDepartment(dto);
         return new ResponseEntity<>(new ApiResponse<>(Map.of("message", message)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public  ResponseEntity<ApiResponse<DepartmentResponseDTO>>update(@Valid @PathVariable Long id, @RequestBody   DepartmentRequestDTO dto) {
         DepartmentResponseDTO  responseDTO = departmentService.updateDepartment(id, dto);

         return new ResponseEntity<>(new ApiResponse<>(responseDTO), HttpStatus.OK);

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String,String>>> delete(@PathVariable Long id) {
         String message = departmentService.deleteDepartment(id);

        return new ResponseEntity<>(new ApiResponse<>(Map.of("message", message)), HttpStatus.OK);
    }
}

