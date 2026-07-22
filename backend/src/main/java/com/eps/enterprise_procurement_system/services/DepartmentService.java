package com.eps.enterprise_procurement_system.services;

import com.eps.enterprise_procurement_system.dto.DepartmentRequestDTO;
import com.eps.enterprise_procurement_system.dto.DepartmentResponseDTO;
import com.eps.enterprise_procurement_system.entities.Department;
import com.eps.enterprise_procurement_system.repositories.DepartmentRepo;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {
    private final DepartmentRepo departmentRepo;
   private final ModelMapper modelMapper;

   public DepartmentService(ModelMapper modelMapper, DepartmentRepo departmentRepo) {
       this.departmentRepo = departmentRepo;
       this.modelMapper = modelMapper;
   }
    
  public DepartmentResponseDTO getDepartment(Long id) {
        Department d = departmentRepo.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Department not found"
                ));
        return modelMapper.map(d, DepartmentResponseDTO.class);
    }

    public List<DepartmentResponseDTO> getDepartments(){
        return departmentRepo.findAll().stream()
            .map(dept -> modelMapper.map(dept, DepartmentResponseDTO.class))
            .toList();
    }

    public String createDepartment(DepartmentRequestDTO dto){
        Optional<Department> department = departmentRepo.findByDepartmentName(dto.getDepartmentName());
        if(department.isPresent()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST , "department with this name already exist");
        }

        Department dept = Department.builder()
                .departmentName(dto.getDepartmentName())
                .createdAt(LocalDateTime.now())
                .build();

        departmentRepo.save(dept);

         return "department created successfully";
    }

    public String deleteDepartment(Long id){
        Department department = departmentRepo.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Department not found"
                        ));
          departmentRepo.deleteById(department.getId());

        return "Department deleted successfully";
    }

    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO dto){

        Department department = departmentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found"
                ));

        department.setDepartmentName(dto.getDepartmentName());
        Department updatedDepartment = departmentRepo.save(department);

        return modelMapper.map(updatedDepartment, DepartmentResponseDTO.class);
    }

}
