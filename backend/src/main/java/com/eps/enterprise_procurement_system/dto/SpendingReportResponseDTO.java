package com.eps.enterprise_procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpendingReportResponseDTO {

    private Summary summary;

    private List<DepartmentSpending> byDepartment;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal total;

        private BigDecimal approved;

        private BigDecimal pending;

        private BigDecimal rejected;

        private BigDecimal completed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentSpending {

        private String name;

        private BigDecimal approved;

        private BigDecimal pending;

        private BigDecimal rejected;
    }
}