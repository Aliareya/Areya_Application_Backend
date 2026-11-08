export const SYSTEM_PERMISSIONS = [
  // Dashboard
  {
    name: 'مشاهده داشبورد',
    slug: 'dashboard.read',
    description: 'امکان مشاهده داشبورد دکان',
  },

  // Users
  {
    name: 'مشاهده کاربران',
    slug: 'users.read',
    description: 'امکان مشاهده کاربران و کارمندان',
  },
  {
    name: 'ایجاد کاربر',
    slug: 'users.create',
    description: 'امکان ثبت کاربر جدید',
  },
  {
    name: 'ویرایش کاربر',
    slug: 'users.update',
    description: 'امکان ویرایش اطلاعات کاربران',
  },
  {
    name: 'حذف کاربر',
    slug: 'users.delete',
    description: 'امکان حذف کاربر',
  },

  // Roles
  {
    name: 'مشاهده نقش‌ها',
    slug: 'roles.read',
    description: 'امکان مشاهده نقش‌ها',
  },
  {
    name: 'ایجاد نقش',
    slug: 'roles.create',
    description: 'امکان ایجاد نقش جدید',
  },
  {
    name: 'ویرایش نقش',
    slug: 'roles.update',
    description: 'امکان ویرایش نقش',
  },
  {
    name: 'حذف نقش',
    slug: 'roles.delete',
    description: 'امکان حذف نقش',
  },

  // Products
  {
    name: 'مشاهده محصولات',
    slug: 'products.read',
    description: 'امکان مشاهده محصولات',
  },
  {
    name: 'ایجاد محصول',
    slug: 'products.create',
    description: 'امکان ثبت محصول جدید',
  },
  {
    name: 'ویرایش محصول',
    slug: 'products.update',
    description: 'امکان ویرایش محصولات',
  },
  {
    name: 'حذف محصول',
    slug: 'products.delete',
    description: 'امکان حذف محصولات',
  },

  // Categories
  {
    name: 'مشاهده دسته‌بندی‌ها',
    slug: 'categories.read',
    description: 'امکان مشاهده دسته‌بندی‌ها',
  },
  {
    name: 'ایجاد دسته‌بندی',
    slug: 'categories.create',
    description: 'امکان ایجاد دسته‌بندی جدید',
  },
  {
    name: 'ویرایش دسته‌بندی',
    slug: 'categories.update',
    description: 'امکان ویرایش دسته‌بندی',
  },
  {
    name: 'حذف دسته‌بندی',
    slug: 'categories.delete',
    description: 'امکان حذف دسته‌بندی',
  },

  // Purchases
  {
    name: 'مشاهده خریدها',
    slug: 'purchases.read',
    description: 'امکان مشاهده خریدها',
  },
  {
    name: 'ثبت خرید',
    slug: 'purchases.create',
    description: 'امکان ثبت خرید جدید',
  },
  {
    name: 'ویرایش خرید',
    slug: 'purchases.update',
    description: 'امکان ویرایش خرید',
  },
  {
    name: 'حذف خرید',
    slug: 'purchases.delete',
    description: 'امکان حذف خرید',
  },

  // Sales
  {
    name: 'مشاهده فروش‌ها',
    slug: 'sales.read',
    description: 'امکان مشاهده فروش‌ها',
  },
  {
    name: 'ثبت فروش',
    slug: 'sales.create',
    description: 'امکان ثبت فروش جدید',
  },
  {
    name: 'ویرایش فروش',
    slug: 'sales.update',
    description: 'امکان ویرایش فروش',
  },
  {
    name: 'حذف فروش',
    slug: 'sales.delete',
    description: 'امکان حذف فروش',
  },

  // Customers
  {
    name: 'مشاهده مشتریان',
    slug: 'customers.read',
    description: 'امکان مشاهده مشتریان',
  },
  {
    name: 'ایجاد مشتری',
    slug: 'customers.create',
    description: 'امکان ثبت مشتری جدید',
  },
  {
    name: 'ویرایش مشتری',
    slug: 'customers.update',
    description: 'امکان ویرایش اطلاعات مشتری',
  },
  {
    name: 'حذف مشتری',
    slug: 'customers.delete',
    description: 'امکان حذف مشتری',
  },

  // Suppliers
  {
    name: 'مشاهده تأمین‌کنندگان',
    slug: 'suppliers.read',
    description: 'امکان مشاهده تأمین‌کنندگان',
  },
  {
    name: 'ایجاد تأمین‌کننده',
    slug: 'suppliers.create',
    description: 'امکان ثبت تأمین‌کننده جدید',
  },
  {
    name: 'ویرایش تأمین‌کننده',
    slug: 'suppliers.update',
    description: 'امکان ویرایش تأمین‌کننده',
  },
  {
    name: 'حذف تأمین‌کننده',
    slug: 'suppliers.delete',
    description: 'امکان حذف تأمین‌کننده',
  },

  // Warehouses
  {
    name: 'مشاهده انبارها',
    slug: 'warehouses.read',
    description: 'امکان مشاهده انبارها',
  },
  {
    name: 'ایجاد انبار',
    slug: 'warehouses.create',
    description: 'امکان ایجاد انبار جدید',
  },
  {
    name: 'ویرایش انبار',
    slug: 'warehouses.update',
    description: 'امکان ویرایش انبار',
  },
  {
    name: 'حذف انبار',
    slug: 'warehouses.delete',
    description: 'امکان حذف انبار',
  },

  // Inventory
  {
    name: 'مشاهده موجودی',
    slug: 'inventory.read',
    description: 'امکان مشاهده موجودی انبار',
  },
  {
    name: 'تعدیل موجودی',
    slug: 'inventory.adjust',
    description: 'امکان اصلاح مقدار موجودی',
  },

  // Reports
  {
    name: 'مشاهده گزارش‌ها',
    slug: 'reports.read',
    description: 'امکان مشاهده گزارش‌های دکان',
  },
] as const;
