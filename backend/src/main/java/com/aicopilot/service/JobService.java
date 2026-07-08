package com.aicopilot.service;

import com.aicopilot.dto.JobDtos;
import com.aicopilot.dto.JobDtos.*;
import com.aicopilot.entity.Job;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.JobRepository;
import com.aicopilot.repository.JobSpecification;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    @Transactional
    public JobDetail createJob(CreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (request.getSourceUrl() != null && !request.getSourceUrl().isBlank()) {
            boolean exists = jobRepository.existsByUserIdAndTitleAndCompanyAndSourceUrl(
                    userId, request.getTitle(), request.getCompany(), request.getSourceUrl());
            if (exists) {
                throw new AppException("A job with this title, company, and source URL already exists",
                        HttpStatus.CONFLICT);
            }
        }

        Job.JobStatus status = parseEnumSafe(request.getStatus(), Job.JobStatus.class, Job.JobStatus.SAVED);
        Job.Priority priority = parseEnumSafe(request.getPriority(), Job.Priority.class, Job.Priority.MEDIUM);
        Job.EmploymentType employmentType = parseEnumSafe(request.getEmploymentType(), Job.EmploymentType.class, null);
        Job.WorkMode workMode = parseEnumSafe(request.getWorkMode(), Job.WorkMode.class, null);
        Job.JobSource source = parseEnumSafe(request.getSource(), Job.JobSource.class, null);
        Job.OfferStatus offerStatus = parseEnumSafe(request.getOfferStatus(), Job.OfferStatus.class, null);

        Job job = Job.builder()
                .user(user)
                .title(request.getTitle().trim())
                .company(request.getCompany().trim())
                .location(request.getLocation() != null ? request.getLocation().trim() : null)
                .employmentType(employmentType)
                .workMode(workMode)
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .description(request.getDescription())
                .skillsRequired(JobDtos.toJsonString(request.getSkillsRequired()))
                .experienceRequired(request.getExperienceRequired())
                .source(source)
                .sourceUrl(request.getSourceUrl())
                .notes(request.getNotes())
                .dateSaved(request.getDateSaved() != null ? request.getDateSaved() : LocalDate.now())
                .deadline(request.getDeadline())
                .priority(priority)
                .status(status)
                .appliedDate(request.getAppliedDate())
                .interviewDates(JobDtos.toJsonString(request.getInterviewDates()))
                .offerStatus(offerStatus)
                .rejectionReason(request.getRejectionReason())
                .followUpDate(request.getFollowUpDate())
                .build();

        job = jobRepository.save(job);

        log.info("Created job: {} for user: {} at {}", job.getId(), userId, job.getCompany());

        return JobDtos.toDetail(job);
    }

    @Transactional(readOnly = true)
    public Page<JobListItem> listUserJobs(UUID userId, String search, String status, String company,
                                          String location, String workMode, Boolean isFavorite,
                                          Boolean isArchived, String priority,
                                          LocalDate dateFrom, LocalDate dateTo,
                                          int page, int size, String sortField, String sortDirection) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        validatePageSize(size);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortField != null && !sortField.isBlank()) {
            Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(dir, mapSortField(sortField));
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        return jobRepository.findAll(
                JobSpecification.withFilters(userId, search, status, company, location,
                        workMode, isFavorite, isArchived, priority, dateFrom, dateTo,
                        sortField, sortDirection),
                pageable
        ).map(JobDtos::toListItem);
    }

    @Transactional(readOnly = true)
    public JobDetail getJob(UUID userId, UUID jobId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        return JobDtos.toDetail(job);
    }

    @Transactional
    public JobDetail updateJob(UUID userId, UUID jobId, UpdateRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        job.setTitle(request.getTitle().trim());
        job.setCompany(request.getCompany().trim());
        job.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        job.setEmploymentType(parseEnumSafe(request.getEmploymentType(), Job.EmploymentType.class, null));
        job.setWorkMode(parseEnumSafe(request.getWorkMode(), Job.WorkMode.class, null));
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setDescription(request.getDescription());
        job.setSkillsRequired(JobDtos.toJsonString(request.getSkillsRequired()));
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSource(parseEnumSafe(request.getSource(), Job.JobSource.class, null));
        job.setSourceUrl(request.getSourceUrl());
        job.setNotes(request.getNotes());
        job.setDateSaved(request.getDateSaved());
        job.setDeadline(request.getDeadline());
        job.setPriority(parseEnumSafe(request.getPriority(), Job.Priority.class, Job.Priority.MEDIUM));

        if (request.getStatus() != null) {
            Job.JobStatus newStatus = parseEnumSafe(request.getStatus(), Job.JobStatus.class, null);
            if (newStatus != null) {
                job.setStatus(newStatus);
                if (newStatus == Job.JobStatus.APPLIED && job.getAppliedDate() == null) {
                    job.setAppliedDate(LocalDate.now());
                }
            }
        }

        job.setAppliedDate(request.getAppliedDate());
        job.setInterviewDates(JobDtos.toJsonString(request.getInterviewDates()));
        job.setOfferStatus(parseEnumSafe(request.getOfferStatus(), Job.OfferStatus.class, null));
        job.setRejectionReason(request.getRejectionReason());
        job.setFollowUpDate(request.getFollowUpDate());

        job = jobRepository.save(job);

        log.info("Updated job: {} for user: {}", jobId, userId);

        return JobDtos.toDetail(job);
    }

    @Transactional
    public JobDetail updateJobStatus(UUID userId, UUID jobId, StatusUpdateRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        Job.JobStatus newStatus = parseEnumSafe(request.getStatus(), Job.JobStatus.class, null);
        if (newStatus == null) {
            throw new AppException("Invalid status: " + request.getStatus(), HttpStatus.BAD_REQUEST);
        }

        job.setStatus(newStatus);

        if (newStatus == Job.JobStatus.APPLIED && job.getAppliedDate() == null) {
            job.setAppliedDate(LocalDate.now());
        }

        if (newStatus == Job.JobStatus.REJECTED && request.getRejectionReason() != null) {
            job.setRejectionReason(request.getRejectionReason());
        }

        job = jobRepository.save(job);

        log.info("Updated status for job: {} to {} for user: {}", jobId, newStatus, userId);

        return JobDtos.toDetail(job);
    }

    @Transactional
    public JobDetail toggleFavorite(UUID userId, UUID jobId, FavoriteRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        job.setFavorite(request.isFavorite());
        job = jobRepository.save(job);

        log.info("Toggled favorite for job: {} to {} for user: {}", jobId, request.isFavorite(), userId);

        return JobDtos.toDetail(job);
    }

    @Transactional
    public JobDetail toggleArchive(UUID userId, UUID jobId, ArchiveRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        job.setArchived(request.isArchived());
        job = jobRepository.save(job);

        log.info("Toggled archive for job: {} to {} for user: {}", jobId, request.isArchived(), userId);

        return JobDtos.toDetail(job);
    }

    @Transactional
    public void deleteJob(UUID userId, UUID jobId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException("Job not found", HttpStatus.NOT_FOUND));

        if (!job.getUser().getId().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        jobRepository.delete(job);

        log.info("Deleted job: {} for user: {}", jobId, userId);
    }

    @Transactional(readOnly = true)
    public JobStats getJobStats(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<Object[]> statusCounts = jobRepository.countByStatus(userId);
        long total = 0;
        long saved = 0;
        long applied = 0;
        long interviewing = 0;
        long offers = 0;
        long accepted = 0;
        long rejected = 0;
        long withdrawn = 0;

        for (Object[] row : statusCounts) {
            Job.JobStatus status = (Job.JobStatus) row[0];
            long count = (Long) row[1];
            switch (status) {
                case SAVED -> saved = count;
                case APPLIED -> applied = count;
                case PHONE_SCREEN, TECHNICAL_INTERVIEW, ONSITE_INTERVIEW -> interviewing += count;
                case OFFER -> offers = count;
                case ACCEPTED -> accepted = count;
                case REJECTED -> rejected = count;
                case WITHDRAWN -> withdrawn = count;
            }
            total += count;
        }

        long archived = jobRepository.countByUserIdAndIsArchivedTrue(userId);
        long favorites = jobRepository.countByUserIdAndIsFavoriteTrue(userId);

        return JobStats.builder()
                .total(total)
                .saved(saved)
                .applied(applied)
                .interviewing(interviewing)
                .offers(offers)
                .accepted(accepted)
                .rejected(rejected)
                .withdrawn(withdrawn)
                .archived(archived)
                .favorites(favorites)
                .build();
    }

    private void validatePageSize(int size) {
        if (size < 1 || size > 100) {
            throw new AppException("Page size must be between 1 and 100", HttpStatus.BAD_REQUEST);
        }
    }

    private <T extends Enum<T>> T parseEnumSafe(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return defaultValue;
        }
    }

    private String mapSortField(String sortField) {
        if (sortField == null) return "createdAt";
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
