package dev.danielk.startjava17.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    public record RegisterRequest(String name, BigDecimal price, int stock, String category) {}
    public record UpdateRequest(String name, BigDecimal price, int stock, String category) {}
    public record ProductResponse(Long id, String name, BigDecimal price, int stock, String category) {
        static ProductResponse from(Product product) {
            return new ProductResponse(
                    product.id(), product.name(), product.price(),
                    product.stock(), product.category().name());
        }
    }

    @PostMapping
    public ResponseEntity<ProductResponse> register(@RequestBody RegisterRequest request) {
        Product product = service.register(
                request.name(), request.price(), request.stock(),
                ProductCategory.valueOf(request.category()));
        return ResponseEntity.ok(ProductResponse.from(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ProductResponse.from(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> findAll() {
        return ResponseEntity.ok(service.findAll().stream().map(ProductResponse::from).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @RequestBody UpdateRequest request) {
        Product product = service.update(
                id, request.name(), request.price(), request.stock(),
                ProductCategory.valueOf(request.category()));
        return ResponseEntity.ok(ProductResponse.from(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
