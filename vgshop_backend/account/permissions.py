from rest_framework import permissions


class IsInCustomerGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name="Customer").exists()


class IsInPublisherGroup(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name="Publisher").exists()
