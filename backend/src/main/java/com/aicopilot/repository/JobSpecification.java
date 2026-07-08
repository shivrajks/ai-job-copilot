package com.aicopilot.repository;

import com.aicopilot.entity.Job;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class JobSpecification {

    public static Specification<Job> withFilters(
            UUID userId, String search, String status, String company,
            String location, String workMode, Boolean isFavorite,
            Boolean isArchived, String priority,
            LocalDate dateFrom, LocalDate dateTo,
            String sortField, String sortDirection) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("company")), pattern),
                        cb.like(cb.lower(root.get("notes")), pattern),
                        cb.like(cb.lower(root.get("location")), pattern)
                ));
            }

            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), Job.JobStatus.valueOf(status.toUpperCase())));
            }

            if (StringUtils.hasText(company)) {
                predicates.add(cb.like(cb.lower(root.get("company")), "%" + company.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(location)) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(workMode)) {
                predicates.add(cb.equal(root.get("workMode"), Job.WorkMode.valueOf(workMode.toUpperCase())));
            }

            if (isFavorite != null) {
                predicates.add(cb.equal(root.get("isFavorite"), isFavorite));
            }

            if (isArchived != null) {
                predicates.add(cb.equal(root.get("isArchived"), isArchived));
            }

            if (StringUtils.hasText(priority)) {
                predicates.add(cb.equal(root.get("priority"), Job.Priority.valueOf(priority.toUpperCase())));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom.atStartOfDay()));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo.plusDays(1).atStartOfDay()));
            }

            if (StringUtils.hasText(sortField)) {
                String field = mapSortField(sortField);
                if (StringUtils.hasText(sortDirection) && sortDirection.equalsIgnoreCase("asc")) {
                    query.orderBy(cb.asc(root.get(field)));
                } else {
                    query.orderBy(cb.desc(root.get(field)));
                }
            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String mapSortField(String sortField) {
        return switch (sortField.toLowerCase()) {
            case "title" -> "title";
            case "company" -> "company";
            case "status" -> "status";
            case "priority" -> "priority";
            case "deadline" -> "deadline";
            case "applied_date", "appliedDate" -> "appliedDate";
            case "updated_at", "updatedAt" -> "updatedAt";
            default -> "createdAt";
        };
    }
}
