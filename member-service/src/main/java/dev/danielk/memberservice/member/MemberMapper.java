package dev.danielk.memberservice.member;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Member 도메인 변환
 *
 * LocalDateTime(도메인) → OffsetDateTime(DTO) 변환:
 *   도메인/영속 레이어는 LocalDateTime을 유지하고,
 *   API 응답 시 시스템 기본 ZoneId를 붙여 OffsetDateTime으로 노출한다.
 */
@Mapper(componentModel = "spring")
public interface MemberMapper {

    @Mapping(target = "role",      expression = "java(member.role().name())")
    @Mapping(target = "createdAt", expression = "java(member.createdAt() != null ? member.createdAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    @Mapping(target = "updatedAt", expression = "java(member.updatedAt() != null ? member.updatedAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    MemberController.MemberResponse toResponse(Member member);

    List<MemberController.MemberResponse> toResponseList(List<Member> members);
}
