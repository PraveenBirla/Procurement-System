package com.eps.enterprise_procurement_system.dto.report;

import java.math.BigDecimal;
import java.util.List;

public record SpendingReportDTO(
    Summary summary,
    List<DepartmentSpending> byDepartment
) {
    public record Summary(
        BigDecimal total,
        BigDecimal approved,
        BigDecimal pending,
        BigDecimal rejected,
        BigDecimal completed
    ) {}

    public record DepartmentSpending(
        String name,
        BigDecimal approved,
        BigDecimal pending,
        BigDecimal rejected
    ) {}
}
