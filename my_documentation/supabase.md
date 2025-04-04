In Supabase, **all of your application users live in `auth.users`**. That table is maintained automatically whenever someone signs up or logs in. Your other tables (such as `public.pips` and the new `employees` table) **reference** those same user IDs in order to attach additional data or control permissions. In other words:

1. **auth.users**  
   The built‐in Supabase table for user accounts. Every user who signs up or is invited appears here. Each row has a unique UUID as `id`.

2. **public.employees**  
   A table you define that points back to `auth.users.id` via a foreign key (usually called `user_id`). You might also store `manager_id` (also pointing to `auth.users.id`) and a `role` column here.  
   - **Why?** Because `auth.users` by itself only has email, phone, etc. If you want to track who’s a manager, who’s in HR, or who manages whom, you need a custom table.  
   - You keep the `auth.users` relationship by referencing their UUID in `employees.user_id`.

3. **public.pips**  
   Your Performance Improvement Plans table, which references `auth.users.id` via its `created_by` column. That’s how you know which user created a given PIP.  

4. **RLS Policies**  
   When you use RLS conditions like `(created_by = auth.uid())` or query `public.employees` to see if `manager_id = auth.uid()`, you are effectively checking the **logged‐in user** (the Supabase session says “which user ID is currently logged in?”) against the relationships in your custom tables.  

**Putting It All Together:**  
- **Log in** as user “Alice” → behind the scenes, `auth.uid()` is Alice’s UUID from `auth.users`.  
- If you check `(pips.created_by = auth.uid())`, you’re verifying “did the current user create this PIP?”  
- Or if you do a sub‐select on `public.employees` to see if the current `auth.uid()` is the manager of the user who created the PIP, you’re effectively asking “Is the logged‐in user the manager of the PIP’s creator?”  
- If so, let them see or edit the row. If not, block them.  

Hence, the `auth.users` table is the source of truth for user identities, and your custom tables (`employees` and `pips`) store business‐specific relationships that RLS checks to grant or restrict access.


