package dev.danielk.startjava17.member;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Member 도메인 변환
 *
 * record는 setter가 없으므로 all-args 생성자를 사용해야 한다.
 * componentModel = "spring" 으로 Spring Bean으로 등록.
 */
@Mapper(componentModel = "spring")
public interface MemberMapper {

    // JoinRequest → Member (id=null, role=USER 는 Member.create() 팩토리에서 처리)
    // 따라서 JoinRequest 필드를 Member.create() 에 넘기는 대신,
    // 여기서는 Request → 파라미터 추출 역할만 하고 Service가 create()를 호출하는 패턴 유지.
    // Response 변환이 핵심 MapStruct 활용 포인트.

    // Member → MemberResponse (role: MemberRole → String)
    @Mapping(target = "role", expression = "java(member.role().name())")
    MemberController.MemberResponse toResponse(Member member);

    List<MemberController.MemberResponse> toResponseList(List<Member> members);
}
