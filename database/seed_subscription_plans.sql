-- Seed: Subscription Plans for WIMUTISASTR
-- Run this after the subscription_plans table has been created.
-- Safe to re-run: clears existing plans and re-inserts fresh data.

TRUNCATE public.subscription_plans RESTART IDENTITY CASCADE;

INSERT INTO public.subscription_plans
  (name, description, price, duration_days, currency, is_active, features, sort_order)
VALUES

  -- ─── Plan 1: Monthly ────────────────────────────────────────────────────────
  (
    'គម្រោងប្រចាំខែ',        -- Monthly Plan
    'ចូលប្រើសៀវភៅ និងវីដេអូច្បាប់ទាំងអស់រយៈពេល ៣០ ថ្ងៃ។ ល្អបំផុតសម្រាប់អ្នកដែលចង់សាកល្បងវេទិកា។',
    3.00,
    30,
    'USD',
    true,
    '[
      "ចូលប្រើឯកសារច្បាប់ទាំងអស់",
      "ចូលប្រើវីដេអូបន្តផ្ទាល់ទាំងអស់",
      "ទាញយកឯកសារ PDF",
      "ស្វែងរកកម្រិតខ្ពស់",
      "ការគាំទ្រតាមអ៊ីមែល"
    ]'::jsonb,
    1
  ),

  -- ─── Plan 2: Quarterly ──────────────────────────────────────────────────────
  (
    'គម្រោង ៣ ខែ',           -- Quarterly Plan
    'ចូលប្រើខ្លឹមសារទាំងអស់រយៈពេល ៩០ ថ្ងៃ ក្នុងតម្លៃប្រសើរជាង។ សន្សំ ១១% បើប្រៀបធៀបនឹងការចុះឈ្មោះប្រចាំខែ។',
    8.00,
    90,
    'USD',
    true,
    '[
      "ចូលប្រើឯកសារច្បាប់ទាំងអស់",
      "ចូលប្រើវីដេអូបន្តផ្ទាល់ទាំងអស់",
      "ទាញយកឯកសារ PDF",
      "ស្វែងរកកម្រិតខ្ពស់",
      "ការគាំទ្រអាទិភាព",
      "សន្សំ 11% ធៀបនឹងប្រចាំខែ"
    ]'::jsonb,
    2
  ),

  -- ─── Plan 3: Yearly (most popular / best value) ─────────────────────────────
  (
    'គម្រោងប្រចាំឆ្នាំ',      -- Yearly Plan
    'ការជ្រើសរើសដ៏ល្អបំផុត — ចូលប្រើបានពេញមួយឆ្នាំ ក្នុងតម្លៃ $30 ប៉ុណ្ណោះ។ ស្មើនឹងទទួលបានឥតគិតថ្លៃ ២ ខែ!',
    30.00,
    365,
    'USD',
    true,
    '[
      "ចូលប្រើឯកសារច្បាប់ទាំងអស់",
      "ចូលប្រើវីដេអូបន្តផ្ទាល់ទាំងអស់",
      "ទាញយកឯកសារ PDF គ្មានដែនកំណត់",
      "ស្វែងរកកម្រិតខ្ពស់",
      "ការគាំទ្រអាទិភាពពេញមួយឆ្នាំ",
      "ចូលប្រើខ្លឹមសារថ្មីដំបូងគេ",
      "ឥតគិតថ្លៃ 2 ខែ (សន្សំ 17%)"
    ]'::jsonb,
    3
  );

-- Verify
SELECT
  name,
  price,
  duration_days,
  is_active,
  sort_order,
  jsonb_array_length(features) AS feature_count
FROM public.subscription_plans
ORDER BY sort_order;
