<?php
namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static Owner()
 * @method static static Admin()
 */
class UserRoleEnum extends Enum
{
    public const Owner = 'owner';
    public const Admin = 'admin';
}
