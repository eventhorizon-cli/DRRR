using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace DRRR.Server.Models
{
    public partial class DrrrDbContext : DbContext
    {
        public virtual DbSet<ChatRoom> ChatRoom { get; set; }
        public virtual DbSet<Connection> Connection { get; set; }
        public virtual DbSet<ChatHistory> ChatHistory { get; set; }
        public virtual DbSet<Role> Role { get; set; }
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<UserStatus> UserStatus { get; set; }

        public DrrrDbContext(DbContextOptions<DrrrDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChatRoom>(entity =>
            {
                entity.ToTable("chat_room");

                entity.HasIndex(e => e.Name)
                    .HasName("name_UNIQUE")
                    .IsUnique();

                entity.HasIndex(e => e.OwnerId)
                    .HasName("user_id_idx");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasColumnType("int(10) unsigned zerofill")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.CreateTime)
                    .HasColumnName("create_time")
                    .HasColumnType("timestamp")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.CurrentUsers)
                    .HasColumnName("current_users")
                    .HasColumnType("int(11) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.IsEncrypted)
                    .HasColumnName("is _encrypted")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.IsHidden)
                    .HasColumnName("is_hidden")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.IsPermanent)
                    .HasColumnName("is_permanent")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.MaxUsers)
                    .HasColumnName("max_users")
                    .HasColumnType("int(11) unsigned");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasMaxLength(20);

                entity.Property(e => e.OwnerId)
                    .HasColumnName("owner_id")
                    .HasColumnType("int(10) unsigned zerofill");

                entity.Property(e => e.PasswordHash)
                    .HasColumnName("password_hash")
                    .HasMaxLength(44);

                entity.Property(e => e.Salt)
                    .HasColumnName("salt")
                    .HasMaxLength(36);

                entity.Property(e => e.AllowGuest)
                    .HasColumnName("allow_guest")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.UpdateTime)
                    .HasColumnName("update_time")
                    .HasColumnType("timestamp")
                    .ValueGeneratedOnAddOrUpdate()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(d => d.Owner)
                    .WithMany(p => p.ChatRoom)
                    .HasForeignKey(d => d.OwnerId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("user_id");
            });

            modelBuilder.Entity<ChatHistory>(entity =>
            {
                entity.HasKey(e => new { e.RoomId, e.UserId, e.UnixTimeMilliseconds });

                entity.ToTable("chat_history");

                entity.HasIndex(e => new { e.RoomId, e.UnixTimeMilliseconds })
                    .HasName("chat_history_idx");

                entity.Property(e => e.RoomId)
                    .HasColumnName("room_id")
                    .HasColumnType("int(10) unsigned zerofill");

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .HasColumnType("int(10) unsigned zerofill");

                entity.Property(e => e.UnixTimeMilliseconds)
                    .HasColumnName("unix_time_milliseconds")
                    .HasColumnType("bigint(20)");

                entity.Property(e => e.Message)
                    .HasColumnName("message")
                    .HasMaxLength(200);

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasColumnName("username")
                    .HasMaxLength(10);

                entity.Property(e => e.IsPicture)
                    .HasColumnName("is_picture") 
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");
            });

            modelBuilder.Entity<Connection>(entity =>
            {
                entity.HasKey(e => new { e.RoomId, e.UserId });

                entity.ToTable("connection");

                entity.HasIndex(e => new { e.RoomId, e.UserId })
                    .HasName("connection_idx");

                entity.Property(e => e.RoomId)
                    .HasColumnName("room_id")
                    .HasColumnType("int(10) unsigned zerofill");

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .HasColumnType("int(10) unsigned zerofill");

                entity.Property(e => e.Username)
                    .HasColumnName("username");

                entity.Property(e => e.ConnectionId)
                    .HasColumnName("connection_id");

                entity.Property(e => e.IsOnline)
                    .HasColumnName("is_online")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("1");

                entity.Property(e => e.IsGuest)
                    .HasColumnName("is_guest")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.IsDeleted)
                    .HasColumnName("is_deleted")
                    .HasColumnType("tinyint(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.UpdateTime)
                    .HasColumnName("update_time")
                    .HasColumnType("timestamp")
                    .ValueGeneratedOnAddOrUpdate()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.CreateTime)
                   .HasColumnName("create_time")
                   .HasColumnType("timestamp")
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("role");

                entity.HasIndex(e => e.Name)
                    .HasName("name")
                    .IsUnique();

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasColumnType("int(1) unsigned")
                    .ValueGeneratedNever();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasMaxLength(5);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("user");

                entity.HasIndex(e => e.RoleId)
                    .HasName("role_id_idx");

                entity.HasIndex(e => e.StatusCode)
                    .HasName("status_code_idx");

                entity.HasIndex(e => e.Username)
                    .HasName("username")
                    .IsUnique();

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasColumnType("int(10) unsigned zerofill")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.CreateTime)
                    .HasColumnName("create_time")
                    .HasColumnType("timestamp")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasColumnName("password_hash")
                    .HasColumnType("char(44)");

                entity.Property(e => e.RoleId)
                    .HasColumnName("role_id")
                    .HasColumnType("int(1) unsigned")
                    .HasDefaultValueSql("1");

                entity.Property(e => e.Salt).HasColumnName("salt");

                entity.Property(e => e.StatusCode)
                    .HasColumnName("status_code")
                    .HasColumnType("int(1) unsigned")
                    .HasDefaultValueSql("0");

                entity.Property(e => e.UpdateTime)
                    .HasColumnName("update_time")
                    .HasColumnType("timestamp")
                    .ValueGeneratedOnAddOrUpdate()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasColumnName("username")
                    .HasMaxLength(10);

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.User)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("role_id");

                entity.HasOne(d => d.Status)
                    .WithMany(p => p.User)
                    .HasForeignKey(d => d.StatusCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("status_code");
            });

            modelBuilder.Entity<UserStatus>(entity =>
            {
                entity.HasKey(e => e.Code);

                entity.ToTable("user_status");

                entity.Property(e => e.Code)
                    .HasColumnName("code")
                    .HasColumnType("int(1) unsigned")
                    .ValueGeneratedNever();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnName("name")
                    .HasMaxLength(10);
            });
        }
    }
}
