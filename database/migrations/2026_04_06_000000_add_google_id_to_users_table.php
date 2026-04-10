<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        // 1. Add google_id column WITHOUT a unique constraint in the Blueprint
        //    (SQL Server cannot create a standard unique index on a nullable column
        //     when multiple existing rows already have NULL — it treats NULLs as duplicates)
        if (!Schema::hasColumn('users', 'google_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('google_id')->nullable()->after('password');
            });
        }

        // 2. Create a FILTERED unique index that ignores NULL values (SQL Server syntax)
        //    This is exactly how SQL Server handles "unique but nullable" correctly.
        if ($driver === 'sqlsrv') {
            DB::statement(
                'CREATE UNIQUE INDEX users_google_id_unique ON users (google_id) WHERE google_id IS NOT NULL'
            );
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('google_id');
            });
        }

        // 3. Make password nullable via raw SQL (avoids needing doctrine/dbal package)
        if ($driver === 'sqlsrv') {
            DB::statement('ALTER TABLE users ALTER COLUMN password NVARCHAR(255) NULL');
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        // Drop the filtered index first, then the column
        if ($driver === 'sqlsrv') {
            DB::statement('DROP INDEX IF EXISTS users_google_id_unique ON users');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique('users_google_id_unique');
            });
        }

        if (Schema::hasColumn('users', 'google_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('google_id');
            });
        }

        // Restore password to NOT NULL
        if ($driver === 'sqlsrv') {
            DB::statement('ALTER TABLE users ALTER COLUMN password NVARCHAR(255) NOT NULL');
        }
    }
};
