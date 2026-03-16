package dev.danielk.startjava17.config;

/**
 * 캐시 이름 상수
 *
 * 문자열 리터럴 대신 상수를 사용해 오타를 방지하고
 * 캐시 이름 변경 시 한 곳만 수정한다.
 */
public final class CacheNames {

    private CacheNames() {}

    public static final String MEMBER        = "member";
    public static final String MEMBER_LIST   = "memberList";
    public static final String PRODUCT       = "product";
    public static final String PRODUCT_LIST  = "productList";
    public static final String ORDER         = "order";
    public static final String ORDER_LIST    = "orderList";
}
