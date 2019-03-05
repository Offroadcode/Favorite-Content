namespace FavoriteContent.Models
{
    public class FavoriteContentApiModel
    {
        public string Name { get; set; }

        public int SortOrder { get; set; }

        public bool? IsFavorite { get; set; }
    }
}
