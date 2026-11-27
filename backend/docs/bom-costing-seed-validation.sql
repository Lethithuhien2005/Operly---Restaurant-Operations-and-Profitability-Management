-- ============================================================================
-- Operly – BOM Costing Seed Validation Suite (Read-Only)
-- Target: operly_db (PostgreSQL)
-- Purpose: Verify Dish BOM Recipes and Inventory Purchase Receipt Prices (LPP)
-- Constraint: 100% Read-Only Queries (SELECT only, zero writes)
-- ============================================================================

\set ON_ERROR_STOP on

-- ============================================================================
-- CHECK 1: All 11 Menu Items Have Associated BOM Recipes
-- Expected: Exactly 11 distinct menu items with recipes; 0 orphaned dishes
-- ============================================================================
SELECT
    m.id,
    m.name AS menu_item_name,
    m.price AS selling_price,
    COUNT(r.id) AS ingredient_count
FROM menu_items m
LEFT JOIN recipes r ON m.id = r.menu_item_id
GROUP BY m.id, m.name, m.price
ORDER BY ingredient_count ASC, m.name ASC;

-- Invariant 1: Dishes with 0 ingredients must be 0
SELECT
    COUNT(*) AS dishes_missing_recipes_count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM menu_items m
LEFT JOIN recipes r ON m.id = r.menu_item_id
WHERE r.id IS NULL;


-- ============================================================================
-- CHECK 2: All Recipe Ingredient References Resolve to Existing Inventory Items
-- Expected: 0 dangling or unresolvable inventory_item_id references
-- ============================================================================
SELECT
    r.id AS recipe_id,
    r.menu_item_id,
    r.inventory_item_id
FROM recipes r
LEFT JOIN inventory_items i ON r.inventory_item_id = i.id
WHERE i.id IS NULL;


-- ============================================================================
-- CHECK 3: All Recipe Quantities Are Strictly Positive
-- Expected: 0 recipes with quantity_required <= 0
-- ============================================================================
SELECT
    r.id AS recipe_id,
    m.name AS menu_item_name,
    i.item_name AS ingredient_name,
    r.quantity_required,
    i.unit
FROM recipes r
JOIN menu_items m ON r.menu_item_id = m.id
JOIN inventory_items i ON r.inventory_item_id = i.id
WHERE r.quantity_required <= 0;


-- ============================================================================
-- CHECK 4: All 14 Inventory Items Have at Least One Valid Purchase Receipt Price
-- Expected: Exactly 14 inventory items, all 14 priced, 0 unpriced
-- ============================================================================
SELECT
    i.id,
    i.item_name,
    i.unit,
    COUNT(d.id) AS receipt_records_count,
    CASE WHEN COUNT(d.id) > 0 THEN 'PRICED' ELSE 'MISSING' END AS status
FROM inventory_items i
LEFT JOIN stock_receipt_details d ON i.id = d.inventory_item_id
GROUP BY i.id, i.item_name, i.unit
ORDER BY receipt_records_count ASC, i.item_name ASC;

-- Invariant 4: Unpriced inventory items count must be 0
SELECT
    COUNT(*) AS unpriced_inventory_items_count,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM inventory_items i
LEFT JOIN stock_receipt_details d ON i.id = d.inventory_item_id
WHERE d.id IS NULL;


-- ============================================================================
-- CHECK 5: Latest Purchase Price (LPP) Per Ingredient Matches Intended Benchmark
-- Evaluates LPP via DISTINCT ON (inventory_item_id) ordered by created_at DESC
-- ============================================================================
WITH latest_purchase_prices AS (
    SELECT DISTINCT ON (d.inventory_item_id)
        d.inventory_item_id,
        i.item_name,
        i.unit,
        d.unit_price AS latest_unit_price,
        r.receipt_code,
        r.created_at AS receipt_created_at
    FROM stock_receipt_details d
    JOIN stock_receipts r ON d.stock_receipt_id = r.id
    JOIN inventory_items i ON d.inventory_item_id = i.id
    ORDER BY d.inventory_item_id, r.created_at DESC, d.id DESC
)
SELECT
    item_name,
    unit,
    latest_unit_price,
    receipt_code,
    receipt_created_at
FROM latest_purchase_prices
ORDER BY item_name ASC;


-- ============================================================================
-- CHECK 6: No Duplicate Recipe Links or Duplicate Receipt Details
-- Expected: 0 duplicate (menu_item_id, inventory_item_id) in recipes;
--           0 duplicate (stock_receipt_id, inventory_item_id) in stock_receipt_details
-- ============================================================================
SELECT
    menu_item_id,
    inventory_item_id,
    COUNT(*) AS duplicate_recipe_count
FROM recipes
GROUP BY menu_item_id, inventory_item_id
HAVING COUNT(*) > 1;

SELECT
    stock_receipt_id,
    inventory_item_id,
    COUNT(*) AS duplicate_detail_count
FROM stock_receipt_details
GROUP BY stock_receipt_id, inventory_item_id
HAVING COUNT(*) > 1;


-- ============================================================================
-- CHECK 7: Existing Six Recipe Quantities Remain Unchanged
-- Verifies the 6 baseline dishes against their canonical specifications
-- ============================================================================
SELECT
    m.name AS menu_item_name,
    i.item_name AS ingredient_name,
    r.quantity_required,
    i.unit
FROM recipes r
JOIN menu_items m ON r.menu_item_id = m.id
JOIN inventory_items i ON r.inventory_item_id = i.id
WHERE m.name IN (
    'Special Traditional Beef Pho (Pho Bo Dac Biet)',
    'Hanoi Grilled Pork with Vermicelli (Bun Cha Ha Noi)',
    'Garlic Butter Tiger Prawns (Tom Sot Bo Toi)',
    'Morning Glory Stir-fried with Garlic (Rau Muong Xao Toi)',
    'Vietnamese Iced Coffee with Condensed Milk (Ca Phe Sua Da)',
    'Vietnamese Caramel Flan (Banh Flan)'
)
ORDER BY m.name ASC, i.item_name ASC;


-- ============================================================================
-- CHECK 8: Existing Receipt REC-202611-001 Remains Unchanged
-- Expected: Exactly 3 lines (Beef Brisket 210,000; Jasmine Rice 20,000; Cooking Oil 42,000)
-- ============================================================================
SELECT
    r.receipt_code,
    i.item_name,
    d.quantity,
    d.unit_price,
    (d.quantity * d.unit_price) AS line_total
FROM stock_receipt_details d
JOIN stock_receipts r ON d.stock_receipt_id = r.id
JOIN inventory_items i ON d.inventory_item_id = i.id
WHERE r.receipt_code = 'REC-202611-001'
ORDER BY i.item_name ASC;


-- ============================================================================
-- CHECK 9: Complete BOM Costing, Gross Profit & Margin % for All 11 Dishes
-- Computes Total BOM Cost = SUM(quantity_required * LPP_unit_price)
-- ============================================================================
WITH latest_purchase_prices AS (
    SELECT DISTINCT ON (d.inventory_item_id)
        d.inventory_item_id,
        d.unit_price AS lpp_unit_price
    FROM stock_receipt_details d
    JOIN stock_receipts r ON d.stock_receipt_id = r.id
    ORDER BY d.inventory_item_id, r.created_at DESC, d.id DESC
),
dish_bom_costs AS (
    SELECT
        m.id AS menu_item_id,
        m.name AS menu_item_name,
        m.price AS selling_price,
        m.cost_price AS static_cost_price,
        COUNT(r.id) AS ingredient_count,
        COALESCE(SUM(r.quantity_required * lpp.lpp_unit_price), 0) AS total_bom_cost
    FROM menu_items m
    JOIN recipes r ON m.id = r.menu_item_id
    JOIN latest_purchase_prices lpp ON r.inventory_item_id = lpp.inventory_item_id
    GROUP BY m.id, m.name, m.price, m.cost_price
)
SELECT
    menu_item_name,
    selling_price,
    total_bom_cost,
    (selling_price - total_bom_cost) AS gross_profit,
    ROUND(((selling_price - total_bom_cost) / selling_price) * 100, 2) AS gross_margin_pct,
    ingredient_count,
    static_cost_price AS original_static_cost
FROM dish_bom_costs
ORDER BY gross_profit DESC;
