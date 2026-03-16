package dev.danielk.startjava17.product;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Product 도메인 변환
 *
 * RegisterRequest / UpdateRequest → Product 변환 시
 * category 필드가 String → ProductCategory enum 이므로 expression으로 처리.
 * id 필드는 저장소가 부여하므로 null로 매핑.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    // RegisterRequest → Product (id=null, category: String→enum)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", expression = "java(ProductCategory.valueOf(request.category()))")
    @Mapping(target = "decreaseStock", ignore = true)
    Product toProduct(ProductController.RegisterRequest request);

    // UpdateRequest → Product (id는 호출부에서 주입, category: String→enum)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", expression = "java(ProductCategory.valueOf(request.category()))")
    @Mapping(target = "decreaseStock", ignore = true)
    Product toProduct(ProductController.UpdateRequest request);

    // Product → ProductResponse (category: enum→String)
    @Mapping(target = "category", expression = "java(product.category().name())")
    ProductController.ProductResponse toResponse(Product product);

    List<ProductController.ProductResponse> toResponseList(List<Product> products);
}
