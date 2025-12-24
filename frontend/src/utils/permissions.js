// Permission definitions for role-based access control
export const PERMISSIONS = {
    // Page View permissions
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_UNCLAIMED: 'view_unclaimed_items',
    VIEW_PENDING: 'view_pending',
    VIEW_COLLECTIONS: 'view_collections',
    VIEW_REPORTS: 'view_reports',
    VIEW_USERS: 'view_users',

    // Action permissions
    CREATE_UNCLAIMED: 'create_unclaimed',
    UPDATE_UNCLAIMED: 'update_unclaimed',
    DELETE_UNCLAIMED: 'delete_unclaimed',
    MARK_AS_COLLECTED: 'mark_as_collected',

    // User permissions
    CREATE_USER: 'create_user',
    UPDATE_USER: 'update_user',
    DELETE_USER: 'delete_user',

    // Reports actions
    EXPORT_REPORTS: 'export_reports',
}

// Role-based permission mapping
const rolePermissions = {
    'admin': [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_UNCLAIMED,
        PERMISSIONS.VIEW_PENDING,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_UNCLAIMED,
        PERMISSIONS.UPDATE_UNCLAIMED,
        PERMISSIONS.DELETE_UNCLAIMED,
        PERMISSIONS.MARK_AS_COLLECTED,
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.EXPORT_REPORTS,
    ],
    'specialist': [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_UNCLAIMED,
        PERMISSIONS.VIEW_PENDING,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.CREATE_UNCLAIMED,
        PERMISSIONS.UPDATE_UNCLAIMED,
        PERMISSIONS.DELETE_UNCLAIMED,
        PERMISSIONS.MARK_AS_COLLECTED,
        PERMISSIONS.EXPORT_REPORTS,
    ],
    'collector': [
        PERMISSIONS.VIEW_UNCLAIMED,
        PERMISSIONS.VIEW_PENDING,
        PERMISSIONS.CREATE_UNCLAIMED,
    ],
    'checker': [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_UNCLAIMED,
        PERMISSIONS.VIEW_PENDING,
        PERMISSIONS.CREATE_UNCLAIMED,
    ],
    'staff': [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_UNCLAIMED,
        PERMISSIONS.VIEW_REPORTS,
    ],
    'general manager': [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS,
    ],
}

// Check if user has a specific permission
export const hasPermission = (user, permission) => {
    if (!user || !user.role) return false
    const userRole = user.role.toLowerCase()
    const permissions = rolePermissions[userRole] || []
    return permissions.includes(permission)
}

// Check if user can perform an action on a specific item
export const canPerformAction = (user, permission, item = null) => {
    if (!hasPermission(user, permission)) return false

    // Additional checks for collectors - they can only edit their own items
    if (user.role.toLowerCase() === 'collector' && item) {
        if (permission === PERMISSIONS.UPDATE_UNCLAIMED) {
            return item.collector === user.fullname
        }
    }

    return true
}
