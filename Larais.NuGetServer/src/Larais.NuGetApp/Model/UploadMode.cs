namespace Larais.NuGetApp.Model
{
    public enum UploadMode
    {
        Everyone = 0,
        RequiresApproval = 1,
        AdminOnly = 2
    }

    public static class UploadModeExtensions
    {
        public static string ToDisplayString(this UploadMode instance)
        {
            switch(instance)
            {
                case UploadMode.Everyone:
                    return "Everyone";
                case UploadMode.RequiresApproval:
                    return "Requires approval";
                case UploadMode.AdminOnly:
                    return "Admin only";
            }

            return string.Empty;
        }
    }
}
