﻿using System;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;

namespace FavoriteContent.Models
{
    [TableName("FavoriteContent")]
    [PrimaryKey("Id", autoIncrement = true)]
    [ExplicitColumns]
    public class FavoriteContentModel
    {
        [Column("Id")]
        [PrimaryKeyColumn(AutoIncrement = true)]
        public int Id { get; set; }

        [Column("PropertyName")]
        public string PropertyName { get; set; }

        [Column("UseCount")]
        public int UseCount { get; set; }

        [Column("IsFavorite")]
        [NullSetting(NullSetting = NullSettings.Null)]
        public bool? IsFavorite { get; set; }

        [Column("UserId")]
        public int UserId { get; set; }

        [Column("SortOrder")]
        public int SortOrder { get; set; }

        [Column("LastUpdated")]
        public DateTime LastUpdated { get; set; }
    }
}
