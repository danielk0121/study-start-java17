package dev.danielk.memberservice.product;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Product 도메인 변환
 *
 * LocalDateTime(도메인) → OffsetDateTime(DTO) 변환:
 *   도메인/영속 레이어는 LocalDateTime을 유지하고,
 *   API 응답 시 시스템 기본 ZoneId를 붙여 OffsetDateTime으로 노출한다.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "category",     expression = "java(ProductCategory.valueOf(request.category()))")
    @Mapping(target = "decreaseStock", ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    Product toProduct(ProductController.RegisterRequest request);

    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "category",     expression = "java(ProductCategory.valueOf(request.category()))")
    @Mapping(target = "decreaseStock", ignore = true)
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    Product toProduct(ProductController.UpdateRequest request);

    @Mapping(target = "category",  expression = "java(product.category().name())")
    @Mapping(target = "createdAt", expression = "java(product.createdAt() != null ? product.createdAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    @Mapping(target = "updatedAt", expression = "java(product.updatedAt() != null ? product.updatedAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    ProductController.ProductResponse toResponse(Product product);

    List<ProductController.ProductResponse> toResponseList(List<Product> products);
}
