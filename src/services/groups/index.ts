import prisma from '@/lib/db/prisma';
import type {
  GroupListParams,
  CreateGroupDTO,
  UpdateGroupDTO,
  AddMemberDTO,
} from '@/types';
import { Prisma } from '@prisma/client';

// ============================================
// Query Functions
// ============================================

export async function getGroups(params: GroupListParams = {}) {
  const {
    page = 1,
    pageSize = 12,
    search,
    institutionId,
    disciplineId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.ResearchGroupWhereInput = {};

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Institution filter
  if (institutionId) {
    where.institutionId = institutionId;
  }

  // Discipline filter (via GroupDiscipline)
  if (disciplineId) {
    where.disciplines = {
      some: {
        disciplineId,
      },
    };
  }

  // Get total count
  const total = await prisma.researchGroup.count({ where });

  // Get groups with relations
  const groups = await prisma.researchGroup.findMany({
    where,
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      college: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
          publications: true,
          news: true,
          patents: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    groups,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getGroupBySlug(slug: string) {
  const group = await prisma.researchGroup.findUnique({
    where: { slug },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      college: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
        },
        orderBy: {
          role: 'asc', // LEADER first
        },
      },
      disciplines: {
        include: {
          discipline: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          publications: true,
          news: true,
          patents: true,
        },
      },
    },
  });

  return group;
}

export async function getGroupById(id: string) {
  return prisma.researchGroup.findUnique({
    where: { id },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      _count: {
        select: {
          members: true,
          publications: true,
          news: true,
          patents: true,
        },
      },
    },
  });
}

// ============================================
// Mutation Functions
// ============================================

export async function createGroup(data: CreateGroupDTO) {
  const { name, slug, description, institutionId, collegeId, departmentId, logo, banner } = data;

  // Check if slug already exists
  const existing = await prisma.researchGroup.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new Error('课题组 URL 别名已存在');
  }

  // Verify institution exists
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    throw new Error('机构不存在');
  }

  return prisma.researchGroup.create({
    data: {
      name,
      slug,
      description,
      institutionId,
      collegeId,
      departmentId,
      logo,
      banner,
    },
  });
}

export async function updateGroup(id: string, data: UpdateGroupDTO) {
  const { name, slug, description, institutionId, collegeId, departmentId, logo, banner } = data;

  // Check if slug already exists (and not this group)
  if (slug) {
    const existing = await prisma.researchGroup.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error('课题组 URL 别名已存在');
    }
  }

  return prisma.researchGroup.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      institutionId,
      collegeId,
      departmentId,
      logo,
      banner,
    },
  });
}

export async function deleteGroup(id: string) {
  return prisma.researchGroup.delete({
    where: { id },
  });
}

// ============================================
// Member Management
// ============================================

export async function getGroupMembers(groupId: string) {
  return prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
    },
    orderBy: {
      role: 'asc',
    },
  });
}

export async function addGroupMember(groupId: string, data: AddMemberDTO) {
  const { userId, role } = data;

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (existing) {
    throw new Error('该用户已是课题组成员');
  }

  return prisma.groupMember.create({
    data: {
      userId,
      groupId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
    },
  });
}

export async function updateGroupMemberRole(groupId: string, userId: string, role: 'LEADER' | 'ADVISOR' | 'MEMBER') {
  return prisma.groupMember.update({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    data: { role },
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });
}

// ============================================
// Institution Tree (for cascading select)
// ============================================

export async function getInstitutionTree() {
  return prisma.institution.findMany({
    include: {
      colleges: {
        include: {
          departments: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}
