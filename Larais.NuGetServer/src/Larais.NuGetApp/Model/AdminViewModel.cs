using System.ComponentModel.DataAnnotations;

namespace Larais.NuGetServer.Model
{
    public class AdminViewModel
    {
        public string PackagePath { get; set; }
        
        public string AdminEmail { get; set; }

        public UploadMode UploadMode { get; set; }
    }

    public class AdminSetupViewModel
    {
        [Required]
        [Display(Name = "Email")]
        [EmailAddress]
        public string Email { get; set; }


        [Required]
        [Display(Name = "Password")]
        [DataType(DataType.Password)]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        [Display(Name = "Repeat password")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string PasswordConfirm { get; set; }

        [Required]
        [Display(Name = "Package path")]
        public string PackagePath { get; set; }
    }
}